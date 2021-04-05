const enumObj = {
  ADMIN: {
    code: 'ADMIN',
    description: 'Task group administrator',
  },
  DOER: {
    code: 'DOER',
    description: 'Task doer',
  },
};

const RoleType = {
  enumObj,
  getKeys: () => Object.keys(enumObj),
  getValueByKey: (key) => enumObj[key],
  getValues: () => Object.values(enumObj),
};

export default RoleType;
