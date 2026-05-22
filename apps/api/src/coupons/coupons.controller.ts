import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UseCouponDto } from './dto/use-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Get('active')
  getActive() {
    return this.service.getActive();
  }

  @Get('used')
  getUsed() {
    return this.service.getUsed();
  }

  @Get('expired')
  getExpired() {
    return this.service.getExpired();
  }

  @Get('history')
  getAllHistory() {
    return this.service.getAllHistory();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Get(':id/history')
  getCouponHistory(@Param('id') id: string) {
    return this.service.getCouponHistory(id);
  }

  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/use')
  use(@Param('id') id: string, @Body() dto: UseCouponDto) {
    return this.service.use(id, dto);
  }
}
