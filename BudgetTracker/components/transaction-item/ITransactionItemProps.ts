import { ICategory } from "../../common/interfaces";
import { ITransaction } from "../../common/interfaces";

export interface ITransactionItemProps {
  transaction: ITransaction;
  categoryId?: string;
  categories?: ICategory[];
}
