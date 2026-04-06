export const getPagination = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export const formatPaginatedData = (data, totalItems, page, limit) => {
    return {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        data
    };
};