export class UpdatePersonalSnapshotDto {
    /** REQUIRED – identifies the row */
    Id: number;

    LastName?: string;
    FirstName?: string;
    MiddleName?: string;
    Suffix?: string;
    Title?: string;
    Alias?: string;
    DateOfBirth?: string;
    PlaceOfBirth?: string;
    Gender?: string;
    NumDependents?: number;
    CivilStatus?: string;
    Nationality?: string;
    MotherMaidenName?: string;
    FatherName?: string;

    MobileNumber?: string;
    OfficeContactNumber?: string;
    HomePhoneNumber?: string;
    EmailAddress?: string;
    FacebookAccount?: string;

    PresentAddress?: string;
    PresentYearsOfStay?: number;
    PresentOwnershipType?: string;

    PermanentAddress?: string;
    PermanentYearsOfStay?: number;
    PermanentOwnershipType?: string;

    EmployerName?: string;
    BusinessNature?: string;
    EmploymentAddress?: string;
    YearsOfService?: number;
    EmployerContactNumber?: string;
    EmployerEmail?: string;
    JobTitle?: string;

    SpouseLastName?: string;
    SpouseFirstName?: string;
    SpouseMiddleName?: string;
    SpouseNickName?: string;
    SpouseDateOfBirth?: string;
    SpousePlaceOfBirth?: string;
    SpouseMobileNumber?: string;
    SpouseEmployerName?: string;
    SpouseEmployerContact?: string;
    SpouseJobTitle?: string;
}
