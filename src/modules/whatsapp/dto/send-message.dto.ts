import { IsString, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * DTO for sending WhatsApp messages
 */
export class SendMessageDto {
  /**
   * Phone number with country code (e.g., "5511999999999")
   * Accepts digits only or formatted numbers
   */
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @MinLength(10, { message: 'Phone number must be at least 10 digits' })
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  @Matches(/^[\d\s\+\(\)\-]+$/, { 
    message: 'Phone number must contain only digits and formatting characters (+, -, (), spaces)' 
  })
  to!: string;

  /**
   * Message text to send
   */
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(4096, { message: 'Message must not exceed 4096 characters (WhatsApp limit)' })
  message!: string;
}
