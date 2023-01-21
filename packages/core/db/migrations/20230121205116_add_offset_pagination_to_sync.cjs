exports.up = function (knex, _) {
    return knex.schema.withSchema('nango').alterTable('_nango_syncs', function (table) {
        table.string('paging_offset_request_path');
        table.string('paging_limit_request_path');
        table.integer('paging_limit');
    });
};

exports.down = function (knex, _) {
    return knex.schema.withSchema('nango').alterTable('_nango_syncs', function (table) {
        table.dropColumn('paging_offset_request_path');
        table.dropColumn('paging_limit_request_path');
        table.dropColumn('paging_limit');
    });
};
