import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'interviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('application_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('applications')
        .onDelete('CASCADE')
      table.timestamp('scheduled_at').notNullable()
      table.string('meeting_link').nullable()
      table.enum('mode', ['presentiel', 'distanciel']).notNullable().defaultTo('distanciel')
      table
        .enum('status', ['planifie', 'termine', 'annule'])
        .notNullable()
        .defaultTo('planifie')
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
