const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);

  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || 10, 1),
    100
  );

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

const getPaginationMeta = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export { getPagination, getPaginationMeta };