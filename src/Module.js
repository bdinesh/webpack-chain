const ChainedMap = require('./ChainedMap');
const Rule = require('./Rule');

module.exports = class extends ChainedMap {
  constructor(parent) {
    super(parent);

    this.rules = new ChainedMap(this);
  }

  rule(name) {
    if (!this.rules.has(name)) {
      this.rules.set(name, new Rule(this));
    }

    return this.rules.get(name);
  }

  toConfig() {
    const config = this.entries();
    const rules = this.rules.values().map(r => r.toConfig());

    if (!config && !rules.length) {
      return;
    }

    return Object.assign({ rules }, config);
  }

  merge(obj) {
    Object
      .keys(obj)
      .forEach(key => {
        const value = obj[key];

        switch (key) {
          case 'rule': {
            return Object
              .keys(value)
              .forEach(name => this.rule(name).merge(value[name]));
          }

          default: {
            this.set(key, value);
          }
        }
      });

    return this;
  }
};
