const enumObj = {
  ONCE: {
    code: 'ONCE',
    description: 'Once',
  },
  DAILY: {
    code: 'DAILY',
    description: 'Daily',
  },
  WEEKLY: {
    code: 'WEEKLY',
    description: 'Weekly',
  },
  MONTHLY: {
    code: 'MONTHLY',
    description: 'Monthly',
  },
};

const FrecuencyType = {
  enumObj,
  getKeys: () => Object.keys(enumObj),
  getValueByKey: (key) => enumObj[key],
  getValues: () => Object.values(enumObj),
};

export default FrecuencyType;
