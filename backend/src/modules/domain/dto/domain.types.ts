/**
 * ==================== DOMAIN GRAPHQL TYPES ====================
 */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class DnsInstructionType {
  @Field() type: string;
  @Field() name: string;
  @Field() value: string;
  @Field() purpose: string;
  @Field() required: boolean;
}

@ObjectType()
export class DomainStatusResponse {
  @Field({ nullable: true }) customDomain?: string;
  @Field() verified: boolean;
  @Field() dnsValid: boolean;
  @Field() sslStatus: string;
  @Field({ nullable: true }) sslExpiresAt?: Date;
  @Field({ nullable: true }) verificationToken?: string;
  @Field(() => [DnsInstructionType]) dnsInstructions: DnsInstructionType[];
  @Field({ nullable: true }) lastDnsCheck?: Date;
}

@ObjectType()
export class AddDomainResponse {
  @Field() domain: string;
  @Field() verificationToken: string;
  @Field(() => [DnsInstructionType]) dnsInstructions: DnsInstructionType[];
}

@ObjectType()
export class VerifyDomainResponse {
  @Field() verified: boolean;
  @Field() txtValid: boolean;
  @Field() cnameValid: boolean;
  @Field() aValid: boolean;
  @Field(() => [String]) errors: string[];
}
