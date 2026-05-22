import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UseCouponDto } from './dto/use-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  @Get()
  getAll(@CurrentUser() user: { id: string }) {
    return this.service.getAll(user.id);
  }

  @Get('active')
  getActive(@CurrentUser() user: { id: string }) {
    return this.service.getActive(user.id);
  }

  @Get('used')
  getUsed(@CurrentUser() user: { id: string }) {
    return this.service.getUsed(user.id);
  }

  @Get('expired')
  getExpired(@CurrentUser() user: { id: string }) {
    return this.service.getExpired(user.id);
  }

  @Get('uncertain')
  getUncertain(@CurrentUser() user: { id: string }) {
    return this.service.getUncertain(user.id);
  }

  @Get('history')
  getAllHistory(@CurrentUser() user: { id: string }) {
    return this.service.getAllHistory(user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.getById(id, user.id);
  }

  @Get(':id/history')
  getCouponHistory(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.getCouponHistory(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateCouponDto, @CurrentUser() user: { id: string }) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto, @CurrentUser() user: { id: string }) {
    return this.service.update(id, user.id, dto);
  }

  @Post(':id/use')
  use(@Param('id') id: string, @Body() dto: UseCouponDto, @CurrentUser() user: { id: string }) {
    return this.service.use(id, user.id, dto);
  }
}
