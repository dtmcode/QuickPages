// 📂 PFAD: backend/src/core/auth/dto/auth.input.ts

import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty({ message: 'Firmenname ist erforderlich' })
  @MaxLength(200)
  companyName: string;

  @Field()
  @IsEmail({}, { message: 'Ungültige E-Mail-Adresse' })
  email: string;

  @Field()
  @MinLength(8, { message: 'Passwort muss mindestens 8 Zeichen haben' })
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Vorname ist erforderlich' })
  @MaxLength(100)
  firstName: string;

  @Field()
  @IsNotEmpty({ message: 'Nachname ist erforderlich' })
  @MaxLength(100)
  lastName: string;

  @Field({ nullable: true })
  package?: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: 'Ungültige E-Mail-Adresse' })
  email: string;

  @Field()
  @MinLength(8, { message: 'Passwort muss mindestens 8 Zeichen haben' })
  password: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsNotEmpty({ message: 'Refresh Token ist erforderlich' })
  refreshToken: string;
}

// ✅ NEU: Passwort vergessen
@InputType()
export class ForgotPasswordInput {
  @Field()
  @IsEmail({}, { message: 'Ungültige E-Mail-Adresse' })
  email: string;
}

// ✅ NEU: Passwort zurücksetzen
@InputType()
export class ResetPasswordInput {
  @Field()
  @IsNotEmpty({ message: 'Token ist erforderlich' })
  token: string;

  @Field()
  @MinLength(8, { message: 'Passwort muss mindestens 8 Zeichen haben' })
  newPassword: string;
}
@InputType()
export class VerifyEmailInput {
  @Field()
  @IsNotEmpty({ message: 'Token ist erforderlich' })
  token: string;
}
