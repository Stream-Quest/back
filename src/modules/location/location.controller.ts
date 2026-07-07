import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationQueryDto } from './dto/location-query.dto';
import { PaginationResponseDto } from '../../dto/pagination-response.dto';
import { LocationResponseDto } from './dto/location-response.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import type { Location } from '../../generated/prisma/client';
import { LocationContext } from './decorator/location.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateLocationRoute,
  DeleteLocationRoute,
  GetLocationDetailsRoute,
  GetLocationListRoute,
  UpdateLocationRoute,
} from './decorator/location-routes.decorator';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('')
  @GetLocationListRoute('Get locations')
  async locationList(
    @Query() filterDto: LocationQueryDto,
  ): Promise<PaginationResponseDto<LocationResponseDto>> {
    return await this.locationService.getLocationList(filterDto);
  }

  @Get(':id')
  @GetLocationDetailsRoute("Get a location's details")
  async locationDetails(
    @Param('id') locationId: string,
  ): Promise<LocationResponseDto> {
    return await this.locationService.getLocation(locationId);
  }

  @Post('')
  @CreateLocationRoute('Create a location')
  async createLocation(
    @Body() createDto: CreateLocationDto,
  ): Promise<LocationResponseDto> {
    return await this.locationService.createLocation(createDto);
  }

  @Patch(':id')
  @UpdateLocationRoute('Update a location')
  async updateLocation(
    @Body() updateDto: UpdateLocationDto,
    @LocationContext() location: Location,
  ): Promise<LocationResponseDto> {
    return await this.locationService.updateLocation(updateDto, location);
  }

  @Delete(':id')
  @DeleteLocationRoute('Delete a location')
  async deleteLocation(
    @LocationContext() location: Location,
  ): Promise<LocationResponseDto> {
    return await this.locationService.deleteLocation(location);
  }
}
