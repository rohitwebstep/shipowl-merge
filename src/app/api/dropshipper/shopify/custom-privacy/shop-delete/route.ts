import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    return NextResponse.json(
        {
            status: false,
            message: 'Your request to delete the shop has been received and is being processed. Please note, this may take a few moments.',
        },
        { status: 202 } // 202 Accepted is more appropriate for a submitted process
    );
}
