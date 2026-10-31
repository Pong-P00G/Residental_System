// Shared pagination helpers so services don't repeat the same query maths.

export const pagination = (query = {}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { page, limit, skip: (page - 1) * limit };
};

export const paginate = async (Model, filter, { page, limit, skip, sort = { createdAt: -1 } }) => {
    const [items, total] = await Promise.all([
        Model.find(filter).sort(sort).skip(skip).limit(limit),
        Model.countDocuments(filter),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const meta = ({ page, limit, total, totalPages }) => ({ page, limit, total, totalPages });
