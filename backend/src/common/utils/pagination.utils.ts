import { PaginationDto } from '../dto/pagination.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';

export async function paginate<T>(
  paginationDto: PaginationDto,
  findFunction: (skip: number, take: number) => Promise<[T[], number]>,
): Promise<PaginationResponseDto<T>> {
  const { page, limit } = paginationDto;
  const skip = paginationDto.skip;

  const [items, total] = await findFunction(skip, limit);

  return new PaginationResponseDto<T>(items, total, page, limit);
}
