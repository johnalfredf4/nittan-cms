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
      SELECT [ID]
            ,[LoanCount]
            ,[Date]
            ,[PersonalTypeId]
            ,[BorrowerNo]
            ,[FirstName]
            ,[MiddleName]
            ,[LastName]
            ,[TINNo]
            ,[SSSNo]
            ,[PassportNo]
            ,[ResCertNo]
            ,[ResCertDateIssed]
            ,[ResCertPlaceIssued]
            ,[Sex]
            ,[MaritalStatus]
            ,[DateOfBirth]
            ,[StreetName]
            ,[BarangaySubdivision]
            ,[CityProvince]
            ,[DistrictMunicipalityId]
            ,[TelNum1]
            ,[TelNum2]
            ,[CellNum]
            ,[FaxNum]
            ,[HomeOwnerShip]
            ,[MonthlySalary]
            ,[Occupation]
            ,[YearsInService]
            ,[EmployerName]
            ,[EmployerAddress]
            ,[EmployerTelNum]
            ,[EmployerFaxNum]
            ,[VisaIDNum]
            ,[VisaDateIssued]
            ,[DateEmployment]
            ,[DateContractExpiry]
            ,[FatherFirstName]
            ,[FatherMiddleName]
            ,[MotherMiddleName]
            ,[MotherLastName]
            ,[FamilyAddress]
            ,[FamilyTelNum]
            ,[FatherLastName]
            ,[MotherFirstName]
            ,[SpouseFirstName]
            ,[SpouseMiddleName]
            ,[SpouseLastName]
            ,[SpouseNickName]
            ,[SpouseEmployer]
            ,[SpouseOfficeAddress]
            ,[SpouseTelNum]
            ,[ReferencePerson1]
            ,[ReferencePerson1Address]
            ,[ReferencePerson1Employer]
            ,[ReferencePerson1TelNum]
            ,[ReferencePerson2]
            ,[ReferencePerson2Address]
            ,[ReferencePerson2Employer]
            ,[ReferencePerson2TelNum]
            ,[GUID]
            ,[FullName]
            ,[Good]
            ,[FullName2]
            ,[RealName]
            ,[NickName]
            ,[DateOfBirth2]
            ,[ProvincialAddress]
            ,[ProvincialAddressFather]
            ,[ProvincialAddressMother]
            ,[TelNoProvinceFather]
            ,[TelNoProvinceMother]
            ,[SFatherFirstName]
            ,[SFatherLastName]
            ,[SFatherMiddleName]
            ,[SMotherFirstName]
            ,[SMotherLastName]
            ,[SMotherMiddleName]
            ,[SParentHomeAddress]
            ,[SParentTelNo]
            ,[SProvincialAddressFather]
            ,[SProvincialAddressMother]
            ,[SProvincialAddress]
            ,[STelNoProvinceFather]
            ,[STelNoProvinceMother]
            ,[SProvincialTelNo]
            ,[BirthPlace]
            ,[NumDependents]
            ,[OtherLicenseNo]
            ,[Dept]
            ,[HomeOwnershipId]
            ,[HomeYear]
            ,[HomeOthers]
            ,[SpouseDept]
            ,[GrossMonthlyIncome]
            ,[TotalDeductions]
            ,[NetPay]
            ,[OwnCar]
            ,[CarMake]
            ,[CarModel]
            ,[CarPlateNo]
            ,[Creditor]
            ,[CreditAmount]
            ,[MonthlyAmort]
            ,[UnpaidBalance]
      FROM [Nittan].[dbo].[tblPersonalInfos]
      WHERE ID = @0
      `,
      [id],
    );

    if (!result || result.length === 0) {
      throw new NotFoundException(`Co-Borrower ID ${id} not found`);
    }

    return result[0];
  }
}
