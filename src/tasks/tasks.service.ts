import { Like, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { GetTasksFilterDto } from './get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './create-task.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {}

  async getTaskById(id: string): Promise<Task> {
    const found = await this.tasksRepository.findOne({
      where: {
        id: id,
      },
    });
    if (found) return found;
    throw new NotFoundException(`Task with ID "${id}" not found`);
  }

  async getAllTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { search, status } = filterDto;

    const whereConditions: any = {};
    if (status) {
      whereConditions.status = status;
    }

    if (search) {
      whereConditions.title = Like(`%${search}%`);
    }

    whereConditions.user = user;

    return await this.tasksRepository.find({
      where: [{ ...whereConditions }],
    });
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const newTask = await this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: TaskStatus.OPEN,
      user: user,
    });
    await this.tasksRepository.save(newTask);
    return newTask;
  }

  async deleteTaskById(taskId: string) {
    const found = await this.getTaskById(taskId);
    if (found) {
      return await this.tasksRepository.delete(taskId);
    }
    throw new NotFoundException(`Task with ID "${taskId}" not found`);
  }

  async updateTaskStatusById(
    taskId: string,
    status: TaskStatus,
  ): Promise<void> {
    const task = await this.getTaskById(taskId); // Checks if it exists.
    task.status = status;
    await this.tasksRepository.save(task);
  }
}
