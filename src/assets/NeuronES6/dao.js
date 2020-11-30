// const D = require("decimal.js");

// const { Accounts } = require("./accounts");
// const { Reserves } = require("./reserves");

import D from 'decimal.js'
// import Accounts from './accounts.js'
// import Reserves from './reserves.js'

const DAYS_PER_YEAR = 365;

class DAO {
    constructor(config, poolNeuron) {
        this.dTokens = { supply: new D(0) };
        this.pool = poolNeuron;
        this.accounts = poolNeuron.accounts;
        this.dailyEmission = new D(config.dailyEmission);
        this.decayRate = new D(config.decayRate);
        this.approvalThreshold = new D(config.approvalThreshold);
        this.day = 1;
        this.proposals = [];
        this.totalSupply = new D(config.dTokensTotalSupply);
        // TODO: add the rest of parameters
        this.allowedParams = ['stabPercentage', 'closeFactor', 'penaltyCoefficient'];
        poolNeuron.addTicker(this.tick);
    }

    tick = (days = 1) => {
        for( let i = days; i--; ) {
          this._issueTokens();
          this.day += 1;
        }
    };

    _calcEmission = (days) => {
      let emissionAmount = this.dailyEmission.mul(D.exp(this.decayRate.div(100).neg().mul(days).div(DAYS_PER_YEAR))).round();
      if (this.dTokens.supply.plus(emissionAmount).gte(this.totalSupply)) {
        // last emission
        emissionAmount = this.totalSupply.minus(this.dTokens.supply);
      }
      return emissionAmount;
    }

    _issueTokens = () => {
        const emissionAmount = this._calcEmission(this.day);
        if (emissionAmount.lte(0)) {
          return;
        }

        this._calcImportanceScores();
        let totalScore = this.accounts.values().reduce((sum, a) => sum.plus(a.dao.importance), new D(0));

        this.accounts.forEach((a) => {
          a.dao.dTokens = a.dao.dTokens.plus(emissionAmount.mul(a.dao.importance.div(totalScore)));
        });
        this.dTokens.supply = this.dTokens.supply.plus(emissionAmount);
    };

    // should take into account deposits, borrows and operations
    _calcImportanceScores = () => {
        const totalDepositsCapital = this._countDepositsCapital();
        const totalBorrowsCapital = this._countBorrowsCapital();
        this.accounts.forEach((a) => {
          let depositImportance = a.dao.accountDepositsCapital.times(100).div(totalDepositsCapital);
          if (!depositImportance.isPositive())
            depositImportance = new D(0);

          let borrowImportance = a.dao.accountBorrowsCapital.times(100).div(totalBorrowsCapital);
          if (!borrowImportance.isPositive())
            borrowImportance = new D(0);

          a.dao.importance = depositImportance.plus(borrowImportance);
        });
        // TODO: count activity
    };

    _countDepositsCapital = () => {
        let totalCapital = this.accounts.values().reduce((total, account) => {
          let accountCapital = Object.values(account.deposits).reduce((cap, d) => cap.plus(d.capital), new D(0));
          account.dao.accountDepositsCapital = accountCapital;
          return total.plus(accountCapital);
        }, new D(0));
        return totalCapital;
    };

    _countBorrowsCapital = () => {
      let totalCapital = this.accounts.values().reduce((total, account) => {
        let accountCapital = account.sumBorrowPlusEffects ? account.sumBorrowPlusEffects : new D(0);
        account.dao.accountBorrowsCapital = accountCapital;
        return total.plus(accountCapital);
      }, new D(0));
      return totalCapital;
    };

    getInfo = () => {
      return {
        accounts: this.accounts.all(),
        dTokens: this.dTokens,
        proposals: Array.from(this.proposals.entries()),
      };
    };

    propose = (proposal) => {
      proposal.approvals = new D(0);
      proposal.status = 'voting';
      proposal.params = Object.fromEntries(
        Object.entries(proposal.params).filter(
          ([key, _]) => this.allowedParams.includes(key)
        )
      );
      if (Object.keys(proposal.params).length > 0) {
        let id = this.proposals.push(proposal) - 1;
        return id;
      }
      return null;
    }

    approve = (accountId, proposalId) => {
      const account = this.accounts.get(accountId);
      let accountWeight = account.dao.dTokens.times(100).div(this.dTokens.supply);
      for (let delegator of account.dao.delegators) {
        let delegatorWeight = this.accounts.get(delegator).dao.dTokens.times(100).div(this.dTokens.supply);
        accountWeight = accountWeight.plus(delegatorWeight);
      }
      if (accountWeight > 0 && proposalId in this.proposals) {
        let proposal = this.proposals[proposalId];
        if (proposal.status !== 'voting')
          return;
        proposal.approvals = proposal.approvals.plus(accountWeight);
        if (proposal.approvals.greaterThan(this.approvalThreshold)) {
          this.accept(proposalId);
        }
      }
    };

    delegate = (delegatorId, voterId) => {
      if (delegatorId === voterId)
        return;
      let delegators = this.accounts.get(voterId).dao.delegators;
      if (delegators.indexOf(delegatorId) === -1)
        delegators.push(delegatorId);
    }

    removeDelegate = (delegatorId, voterId) => {
      if (delegatorId === voterId)
        return;
      let delegators = this.accounts.get(voterId).dao.delegators;
      this.accounts.get(voterId).dao.delegators = delegators.filter(el => el !== delegatorId);
    }

    accept = (proposalId) => {
      let proposal = this.proposals[proposalId];
      if (proposal.approvals.lte(this.approvalThreshold) || proposal.status !== 'voting') {
        return false;
      }
      proposal.status = 'accepted';
      this.pool._setParameters(proposal.params);
      return true;
    };
}

// module.exports = { DAO };

export default DAO;