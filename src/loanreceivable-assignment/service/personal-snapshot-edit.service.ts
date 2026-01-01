import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdatePersonalSnapshotsDto } from '../dto/personal-snapshot/update-personal-snapshots.dto';

@Injectable()
export class PersonalSnapshotEditService {
    constructor(
        @InjectDataSource('nittan_app')
        private readonly db: DataSource,
    ) { }

    async updateSnapshots(
        loanAssignmentId: number,
        dto: UpdatePersonalSnapshotsDto,
    ) {
        return this.db.transaction(async manager => {
            for (const s of dto.snapshots) {
                await manager.query(
                    `
          UPDATE dbo.LoanAssignment_PersonalSnapshot
          SET
            LastName                = COALESCE(@1, LastName),
            FirstName               = COALESCE(@2, FirstName),
            MiddleName              = COALESCE(@3, MiddleName),
            Suffix                  = COALESCE(@4, Suffix),
            Title                   = COALESCE(@5, Title),
            Alias                   = COALESCE(@6, Alias),
            DateOfBirth             = COALESCE(@7, DateOfBirth),
            PlaceOfBirth            = COALESCE(@8, PlaceOfBirth),
            Gender                  = COALESCE(@9, Gender),
            NumDependents           = COALESCE(@10, NumDependents),
            CivilStatus             = COALESCE(@11, CivilStatus),
            Nationality             = COALESCE(@12, Nationality),
            MotherMaidenName        = COALESCE(@13, MotherMaidenName),
            FatherName              = COALESCE(@14, FatherName),
            MobileNumber            = COALESCE(@15, MobileNumber),
            OfficeContactNumber     = COALESCE(@16, OfficeContactNumber),
            HomePhoneNumber         = COALESCE(@17, HomePhoneNumber),
            EmailAddress            = COALESCE(@18, EmailAddress),
            FacebookAccount         = COALESCE(@19, FacebookAccount),
            PresentAddress          = COALESCE(@20, PresentAddress),
            PresentYearsOfStay      = COALESCE(@21, PresentYearsOfStay),
            PresentOwnershipType    = COALESCE(@22, PresentOwnershipType),
            PermanentAddress        = COALESCE(@23, PermanentAddress),
            PermanentYearsOfStay    = COALESCE(@24, PermanentYearsOfStay),
            PermanentOwnershipType  = COALESCE(@25, PermanentOwnershipType),
            EmployerName            = COALESCE(@26, EmployerName),
            BusinessNature          = COALESCE(@27, BusinessNature),
            EmploymentAddress       = COALESCE(@28, EmploymentAddress),
            YearsOfService          = COALESCE(@29, YearsOfService),
            EmployerContactNumber   = COALESCE(@30, EmployerContactNumber),
            EmployerEmail           = COALESCE(@31, EmployerEmail),
            JobTitle                = COALESCE(@32, JobTitle),
            SpouseLastName          = COALESCE(@33, SpouseLastName),
            SpouseFirstName         = COALESCE(@34, SpouseFirstName),
            SpouseMiddleName        = COALESCE(@35, SpouseMiddleName),
            SpouseNickName          = COALESCE(@36, SpouseNickName),
            SpouseDateOfBirth       = COALESCE(@37, SpouseDateOfBirth),
            SpousePlaceOfBirth      = COALESCE(@38, SpousePlaceOfBirth),
            SpouseMobileNumber      = COALESCE(@39, SpouseMobileNumber),
            SpouseEmployerName      = COALESCE(@40, SpouseEmployerName),
            SpouseEmployerContact   = COALESCE(@41, SpouseEmployerContact),
            SpouseJobTitle          = COALESCE(@42, SpouseJobTitle),
            UpdatedAt               = GETDATE()
          WHERE Id = @0
            AND LoanAssignmentId = @43
          `,
                    [
                        s.Id,
                        s.LastName,
                        s.FirstName,
                        s.MiddleName,
                        s.Suffix,
                        s.Title,
                        s.Alias,
                        s.DateOfBirth,
                        s.PlaceOfBirth,
                        s.Gender,
                        s.NumDependents,
                        s.CivilStatus,
                        s.Nationality,
                        s.MotherMaidenName,
                        s.FatherName,
                        s.MobileNumber,
                        s.OfficeContactNumber,
                        s.HomePhoneNumber,
                        s.EmailAddress,
                        s.FacebookAccount,
                        s.PresentAddress,
                        s.PresentYearsOfStay,
                        s.PresentOwnershipType,
                        s.PermanentAddress,
                        s.PermanentYearsOfStay,
                        s.PermanentOwnershipType,
                        s.EmployerName,
                        s.BusinessNature,
                        s.EmploymentAddress,
                        s.YearsOfService,
                        s.EmployerContactNumber,
                        s.EmployerEmail,
                        s.JobTitle,
                        s.SpouseLastName,
                        s.SpouseFirstName,
                        s.SpouseMiddleName,
                        s.SpouseNickName,
                        s.SpouseDateOfBirth,
                        s.SpousePlaceOfBirth,
                        s.SpouseMobileNumber,
                        s.SpouseEmployerName,
                        s.SpouseEmployerContact,
                        s.SpouseJobTitle,
                        loanAssignmentId,
                    ],
                );
            }

            return { ok: true };
        });
    }
}
