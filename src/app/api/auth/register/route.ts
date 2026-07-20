import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(['Citizen', 'Law Enforcement', 'Financial Institution', 'Admin']).default('Citizen')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate inputs
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password, displayName, phoneNumber, role } = parsed.data;

    // Create auth signup passing metadata for trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName || email.split('@')[0],
          phone: phoneNumber || '',
          role: role
        }
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const userId = data.user?.id;

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: userId,
        email,
        role: role,
        displayName: displayName || email.split('@')[0]
      }
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
