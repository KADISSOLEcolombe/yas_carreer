import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('role', ['admin', 'rh', 'candidat'])
        .notNullable()
        .defaultTo('candidat')
      table.string('phone', 30).nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
      table.dropColumn('phone')
      table.dropColumn('is_active')
    })
  }
}
