import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'applications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('offer_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('offers')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('cv_url').nullable()
      table.string('cover_letter_url').nullable()
      table.text('cover_letter_text').nullable()
      table
        .enum('status', [
          'envoyee',
          'en_cours_analyse',
          'entretien_programme',
          'acceptee',
          'rejetee',
        ])
        .notNullable()
        .defaultTo('envoyee')
      table.integer('ai_match_score').nullable()
      table.text('ai_summary').nullable()
      table.timestamp('ai_analyzed_at').nullable()
      table.timestamp('applied_at').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['offer_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
