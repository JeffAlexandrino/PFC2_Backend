-- AlterTable
ALTER TABLE "_FornecedorToVendaProduto" ADD CONSTRAINT "_FornecedorToVendaProduto_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FornecedorToVendaProduto_AB_unique";

-- AlterTable
ALTER TABLE "_UserRoleToVenda" ADD CONSTRAINT "_UserRoleToVenda_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserRoleToVenda_AB_unique";

-- AlterTable
ALTER TABLE "_VendaToVendedor" ADD CONSTRAINT "_VendaToVendedor_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_VendaToVendedor_AB_unique";
