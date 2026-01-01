import {
    Controller,
    Patch,
    Param,
    Body,
    ParseIntPipe,
} from '@nestjs/common';
import { PersonalSnapshotEditService } from '../service/personal-snapshot-edit.service';
import { UpdatePersonalSnapshotsDto } from '../dto/personal-snapshot/update-personal-snapshots.dto';

@Controller('loanreceivable-assignment')
export class PersonalSnapshotController {
    constructor(
        private readonly service: PersonalSnapshotEditService,
    ) { }

    @Patch(':loanAssignmentId/personal-snapshots')
    updatePersonalSnapshots(
        @Param('loanAssignmentId', ParseIntPipe) loanAssignmentId: number,
        @Body() dto: UpdatePersonalSnapshotsDto,
    ) {
        return this.service.updateSnapshots(loanAssignmentId, dto);
    }
}
