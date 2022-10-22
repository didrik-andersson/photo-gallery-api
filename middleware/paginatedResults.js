function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    
    const filters = req.query.filters && req.query.filters.split(":");
    const sortBy = req.query.sortBy;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {
      data: [],
      next: false,
      previous: false,
      totalHits: 0,
    };

    const mapElemObjects = (values, field) => {
      const objects = values.map((value) => {
        return {
          $elemMatch: { [field]: value },
        };
      });
      return objects;
    };

    const getSortBy = () =>
    sortBy === 'priceAsc'
      ? { minPrice: 1 }
      : sortBy === 'priceDesc'
      ? { maxPrice: -1 }
      : { _id: 1 };

    try {
      results.data = await model.aggregate([
        {
          $match:
            filters && filters?.length
              ? {
                  retailers: {
                    $elemMatch: {
                      sizes: {
                        $all: mapElemObjects(filters[1].split(","), "size"),
                      },
                    },
                  },
                }
              : {},
        },
        {
          $addFields: {
            maxPrice: {
              $max: {
                $map: {
                  input: '$retailers.sizes.price',
                  in: { $max: '$$this' },
                },
              },
            },
            minPrice: {
              $min: {
                $map: {
                  input: '$retailers.sizes.price',
                  in: { $min: '$$this' },
                },
              },
            },
          },
        },
        {
          $facet: {
            documents: [
              { $match: {} },
              { $skip: startIndex },
              { $limit: limit },
              {
                $sort: getSortBy(),
              },
            ],
            searchInfo: [{ $count: "totalHits" }],
            size: [
              {
                $unwind: {
                  path: "$retailers",
                },
              },
              {
                $unwind: {
                  path: "$retailers.sizes",
                },
              },
              {
                $group: {
                  _id: "$retailers.sizes.size",
                  count: { $sum: 1 },
                },
              },
              {
                $set: {
                  sortProperty: {
                    $toDecimal: {
                      $replaceOne: {
                        input: "$_id",
                        find: "x",
                        replacement: ".",
                      },
                    },
                  },
                },
              },
              {
                $sort: { sortProperty: 1 },
              },
              {
                $project: {
                  _id: 0,
                  label: "$_id",
                  count: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            searchResult: "$documents",
            totalHits: {
              $cond: {
                if: { $eq: [{ $size: "$searchInfo.totalHits" }, 0] },
                then: 0,
                else: { $arrayElemAt: ["$searchInfo.totalHits", 0] },
              },
            },
            buckets: [{ values: "$size", property: "size", label: "Storlek" }],
          },
        },
      ]);

      if (endIndex < results?.data[0]?.totalHits) {
        results.next = {
          page: page + 1,
          limit: limit,
        };
      }

      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit,
        };
      }

      res.paginatedResults = results;

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
      console.log(error);
    }
  };
}

module.exports = paginatedResults;
