exports.up = function (knex, _) {
    return knex.schema.withSchema('nango').alterTable('_nango_syncs', function (table) {
        table.string('nango_connection_id');
        table.string('nango_provider_config_key');
    });
};

exports.down = function (knex, _) {
    return knex.schema.withSchema('nango').alterTable('_nango_syncs', function (table) {
        table.dropColumn('nango_connection_id');
        table.dropColumn('nango_provider_config_key');
    });
};
