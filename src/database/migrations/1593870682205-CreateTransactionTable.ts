import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateTransactionTable1593870682205 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(new Table({
            name: 'transactions',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()'
                },
                {
                    name: 'title',
                    type: 'varchar',
                },
                {
                    name: 'type',
                    type: 'varchar',
                },
                {
                    name: 'value',
                    type: 'decimal',
                    precision: 10,
                    scale: 2
                },
                {
                    name: 'category_id',
                    type: 'uuid',
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'now()'
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'now()'
                },
            ]
        }));

        await queryRunner.createForeignKey('transactions', new TableForeignKey({
            name: 'FK_TRANSACTION_CATEGORY',
            columnNames: ['category_id'], //coluna da chave estrangeira na tabela transactions
            referencedColumnNames: ['id'], //coluna na tabela transactions que a fk relaciona
            referencedTableName: 'categories', //nome da tabela de relacionamento
            onDelete: 'SET NULL', //se categoria for deletada, category_id ficará null
            onUpdate: 'CASCADE' //se categoria tiver id alterado, category_id também deverá ser alterado
        })); 
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey('transactions', 'FK_TRANSACTION_CATEGORY');
        await queryRunner.dropTable('transactions');
    }

}
