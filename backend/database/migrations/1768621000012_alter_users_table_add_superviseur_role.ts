import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('role', ['admin', 'rh', 'candidat', 'superviseur'])
        .notNullable()
        .defaultTo('candidat')
        .alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('role', ['admin', 'rh', 'candidat']).notNullable().defaultTo('candidat').alter()
    })
  }
}
