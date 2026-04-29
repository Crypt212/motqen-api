import {
  Negotiation,
  NegotiationCreateInput,
  NegotiationFilter,
  NegotiationUpdateInput,
} from '../../domain/negotiation.entity.js';

export default interface INegotiationRepository {
  find({ filter }: { filter: NegotiationFilter }): Promise<Negotiation | null>;
  findMany({ filter }: { filter: NegotiationFilter }): Promise<Negotiation[]>;
  create({ negotiation }: { negotiation: NegotiationCreateInput }): Promise<Negotiation>;
  update({
    filter,
    negotiation,
  }: {
    filter: NegotiationFilter;
    negotiation: NegotiationUpdateInput;
  }): Promise<Negotiation>;
}
