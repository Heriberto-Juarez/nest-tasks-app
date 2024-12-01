import { Like, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { GetTasksFilterDto } from './get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './create-task.dto';

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

  async getTasksWithFilter(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { search, status } = filterDto;

    const whereConditions: any = {};
    if (status) {
      whereConditions.status = status;
    }

    if (search) {
      whereConditions.title = Like(`%${search}%`);
    }

    return await this.tasksRepository.find({
      where: [{ ...whereConditions }],
    });
  }

  async getAllTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    if (Object.keys(filterDto).length > 0) {
      return this.getTasksWithFilter(filterDto);
    }
    return await this.tasksRepository.find();
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const newTask = await this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: TaskStatus.OPEN,
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
