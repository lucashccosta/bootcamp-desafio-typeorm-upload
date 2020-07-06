import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository'

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const readStream = fs.createReadStream(path);
    const parsers = csvParse({
      delimiter: ',',
      from_line: 2, //inicio dos dados (exclui header)
    });

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    const parseCSV = readStream.pipe(parsers); //lê linha a linha
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => cell.trim());

      if(!title || !type || !value || !category) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));
    
    const existentCategories = await categoryRepository.find({
      where: {
        title: In(categories)
      }
    });

    const existentCategoriesTitles = existentCategories.map((category: Category) => category.title);
    const addCategoryTitles = categories.filter(
      category => !existentCategoriesTitles.includes(category)
    ).filter((value, index, self) => self.indexOf(value) === index);
    
    const newCategories = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title
      }))
    );

    await categoryRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionRepository.create(
      transactions.map((transaction: CSVTransaction) => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(category => category.title === transaction.category)
      }))
    );

    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(path);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
