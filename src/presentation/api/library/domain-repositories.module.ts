import { Module } from "@nestjs/common";

import { LibraryCollection } from "../../../domain/repositories/libraryCollection.repository";
import { LoanRegister } from "../../../domain/repositories/loanRegister.repository";

@Module({
  providers: [
    { provide: LibraryCollection, useFactory: () => new LibraryCollection() },
    { provide: LoanRegister, useFactory: () => new LoanRegister() },
  ],
  exports: [LibraryCollection, LoanRegister],
})
export class DomainRepositoriesModule {}
