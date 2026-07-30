import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'offers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title').notNullable()
      table.enum('type', ['stage', 'emploi']).notNullable()
      table.text('description').notNullable()
      table.text('requirements').nullable()
      table.timestamp('deadline').nullable()
      table.string('location').nullable()
      table
        .enum('status', ['brouillon', 'publiee', 'fermee'])
        .notNullable()
        .defaultTo('brouillon')
      table
        .integer('created_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
