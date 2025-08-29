import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BlockIpsRepo } from "./ip/ip.adapter";
import { Ips } from "../entity/ips-entity";

export type IpsDataDto = {
  ip: string;
  path: string;
  date: number;
};

@Injectable()
export class BlockIpsService {
  constructor(
    private readonly blockIpsRepo: BlockIpsRepo,
  ) {}

  async addIpData(ipsData: IpsDataDto): Promise<boolean> {
    const newIp = new Ips();
    newIp.dateNumber = ipsData.date;
    newIp.ip = ipsData.ip;
    newIp.requestPath = ipsData.path;

    try {
      await this.blockIpsRepo.saveIp(newIp);
      return true;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }

  //scheduler
  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    this.blockIpsRepo.dropIps();
  }
}
