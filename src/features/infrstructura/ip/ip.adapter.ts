import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DataSource } from "typeorm";
import { Ips } from "../../entity/ips-entity";

export class BlockIpsRepo {
  constructor(
    protected dataSource: DataSource,
    @InjectRepository(Ips)
    private blockIpsRepository: Repository<Ips>,
  ) {}

  async saveIp(ip: Ips): Promise<Ips> {
    return this.blockIpsRepository.save(ip);
  }

  async findIp(ip: string, path: string, dateLeft: number, dateRight: number) {
    const ips = await this.blockIpsRepository
      .createQueryBuilder("ips")
      .where("ips.ip = :ip", { ip })
      .andWhere("ips.requestPath = :path", { path })
      .andWhere("ips.dateNumber >= :dateLeft", { dateLeft })
      .andWhere("ips.dateNumber <= :dateRight", { dateRight })
      .getMany();

    return ips;
  }

  async dropIps() {
    await this.dataSource.query(`DELETE FROM public."ips"`);
  }
}
