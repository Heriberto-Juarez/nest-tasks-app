import { CreateTaskDto } from './create-task.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GetTasksFilterDto } from './get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './update-task-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@UseGuards(AuthGuard())
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getAllTasks(@Query() filterDto: GetTasksFilterDto, @GetUser() user: User) {
    return this.tasksService.getAllTasks(filterDto, user);
  }

  @Get('/:id')
  async getTaskById(@Param('id') id: string, @GetUser() user: User) {
    return await this.tasksService.getTaskById(id, user);
  }

  @Post()
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ) {
    return await this.tasksService.createTask(createTaskDto, user);
  }

  @Delete('/:id')
  async deleteTaskById(@Param('id') id: string, @GetUser() user: User) {
    return await this.tasksService.deleteTaskById(id, user);
  }

  @Patch('/:id/status')
  updateTaskStatusById(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User,
  ) {
    const { status } = updateTaskStatusDto;
    this.tasksService.updateTaskStatusById(id, status, user);
  }
}
