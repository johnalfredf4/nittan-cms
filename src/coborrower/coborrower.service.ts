import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class CoBorrowerService {
  constructor(
    @InjectConnection('nittan')
    private readonly nittanConnection: Connection,
  ) {}

  async getCoBorrowerById(id: number) {
    const result = await this.nittanConnection.query(
      `
      SELECT p.[ID]
      ,p.[LoanCount]
      ,p.[Date]
      ,p.[PersonalTypeId]
      ,p.[BorrowerNo]
      ,p.[FirstName]
      ,p.[MiddleName]
      ,p.[LastName]
      ,p.[TINNo]
      ,p.[SSSNo]
      ,p.[PassportNo]
      ,p.[ResCertNo]
      ,p.[ResCertDateIssed]
      ,p.[ResCertPlaceIssued]
      ,p.[Sex]
      ,p.[MaritalStatus]
      ,p.[DateOfBirth]
      ,p.[StreetName]
      ,p.[BarangaySubdivision]
      ,p.[CityProvince]
      ,p.[DistrictMunicipalityId]
      ,p.[TelNum1]
      ,p.[TelNum2]
      ,p.[CellNum]
      ,p.[FaxNum]
      ,p.[HomeOwnerShip]
      ,p.[MonthlySalary]
      ,p.[Occupation]
      ,p.[YearsInService]
      ,p.[EmployerName]
      ,p.[EmployerAddress]
      ,p.[EmployerTelNum]
      ,p.[EmployerFaxNum]
      ,p.[VisaIDNum]
      ,p.[VisaDateIssued]
      ,p.[DateEmployment]
      ,p.[DateContractExpiry]
      ,p.[FatherFirstName]
      ,p.[FatherMiddleName]
      ,p.[MotherMiddleName]
      ,p.[MotherLastName]
      ,p.[FamilyAddress]
      ,p.[FamilyTelNum]
      ,p.[FatherLastName]
      ,p.[MotherFirstName]
      ,p.[SpouseFirstName]
      ,p.[SpouseMiddleName]
      ,p.[SpouseLastName]
      ,p.[SpouseNickName]
      ,p.[SpouseEmployer]
      ,p.[SpouseOfficeAddress]
      ,p.[SpouseTelNum]
      ,p.[ReferencePerson1]
      ,p.[ReferencePerson1Address]
      ,p.[ReferencePerson1Employer]
      ,p.[ReferencePerson1TelNum]
      ,p.[ReferencePerson2]
      ,p.[ReferencePerson2Address]
      ,p.[ReferencePerson2Employer]
      ,p.[ReferencePerson2TelNum]
      ,p.[GUID]
      ,p.[FullName]
      ,p.[Good]
      ,p.[FullName2]
      ,p.[RealName]
      ,p.[NickName]
      ,p.[DateOfBirth2]
      ,p.[ProvincialAddress]
      ,p.[ProvincialAddressFather]
      ,p.[ProvincialAddressMother]
      ,p.[TelNoProvinceFather]
      ,p.[TelNoProvinceMother]
      ,p.[SFatherFirstName]
      ,p.[SFatherLastName]
      ,p.[SFatherMiddleName]
      ,p.[SMotherFirstName]
      ,p.[SMotherLastName]
      ,p.[SMotherMiddleName]
      ,p.[SParentHomeAddress]
      ,p.[SParentTelNo]
      ,p.[SProvincialAddressFather]
      ,p.[SProvincialAddressMother]
      ,p.[SProvincialAddress]
      ,p.[STelNoProvinceFather]
      ,p.[STelNoProvinceMother]
      ,p.[SProvincialTelNo]
      ,p.[BirthPlace]
      ,p.[NumDependents]
      ,p.[OtherLicenseNo]
      ,p.[Dept]
      ,p.[HomeOwnershipId]
      ,p.[HomeYear]
      ,p.[HomeOthers]
      ,p.[SpouseDept]
      ,p.[GrossMonthlyIncome]
      ,p.[TotalDeductions]
      ,p.[NetPay]
      ,p.[OwnCar]
      ,p.[CarMake]
      ,p.[CarModel]
      ,p.[CarPlateNo]
      ,p.[Creditor]
      ,p.[CreditAmount]
      ,p.[MonthlyAmort]
      ,p.[UnpaidBalance]
      ,l.*
  FROM [Nittan].[dbo].[tblPersonalInfos] p
  LEFT JOIN [Nittan].[dbo].tblLoanApplications l ON p.ID=l.BorrowerId
  WHERE p.ID = @0
      `,
      [id],
    );

    if (!result || result.length === 0) {
      throw new NotFoundException(`Co-Borrower ID ${id} not found`);
    }

    return result[0];
  }
}
