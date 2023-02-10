exports.up = function (knex, _) {
    return knex.schema.withSchema('nango').alterTable('_nango_syncs', function (table) {
        table.string('paging_number_request_path');
    });
};

exports.down = function (knex, _) {
    return knex.schema.withSchema('nango').alterTable('_nango_syncs', function (table) {
        table.dropColumn('paging_number_request_path');
    });
};
