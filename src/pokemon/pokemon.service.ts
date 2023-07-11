import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from "@nestjs/mongoose";
import { isValidObjectId, Model } from "mongoose";
import { Pokemon } from "./entities/pokemon.entity";

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}
  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (e) {
      this.handleException(e);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLowerCase().trim(),
      });
    }
    if (!pokemon)
      throw new NotFoundException(`Pokemon searched with ${term} not found`)
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term);
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      }
      const pokemonUpdated = await pokemon.updateOne(updatePokemonDto, { new: true });
      return pokemonUpdated;
    } catch (e) {
      this.handleException(e);
    }
  }

  async remove(id: string) {
    const pokemon = await this.findOne(id);
    // this.pokemonModel.findByIdAndDelete()
    await pokemon.deleteOne();
  }
  private handleException(e: any) {
    if (e instanceof NotFoundException) {
      throw e;
    }
    if (e.code === 11000) {
      const log = `${JSON.stringify(e.keyValue)}`;
      throw new BadRequestException(`Pokemon exist in DB ${log}`);
    }
    console.log(e);
    throw new InternalServerErrorException('Error - Check Logs');
  }
}
