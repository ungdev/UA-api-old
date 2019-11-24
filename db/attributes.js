module.exports = (Attribute) => {
  let attributes = [
    { id: 2, label: 'S', value: 's' },
    { id: 3, label: 'M', value: 'm' },
    { id: 4, label: 'L', value: 'l' },
    { id: 5, label: 'XL', value: 'xl' },
  ];

  attributes = attributes.map((attribute) => ({
    ...attribute,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  Attribute.bulkCreate(attributes);
};
