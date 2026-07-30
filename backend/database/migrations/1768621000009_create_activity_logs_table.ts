import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activity_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('action', 80).notNullable()
      table.string('category', 40).notNullable().defaultTo('general')
      table.string('summary', 500).notNullable()
      table.string('resource_type', 60).nullable()
      table.integer('resource_id').unsigned().nullable()
      table.json('metadata').nullable()
      table.string('ip_address', 64).nullable()
      table.string('user_agent', 500).nullable()
      table.timestamp('created_at').notNullable()

      table.index(['user_id', 'created_at'])
      table.index(['action'])
      table.index(['category'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
