import { getOrderById } from "@/app/models/order/order";
import { logMessage } from "../commonUtils";
import { NextResponse } from "next/server";

interface ShippingApiResult {
    data: {
        awb_number?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

function isShippingApiResult(obj: unknown): obj is ShippingApiResult {
    if (
        typeof obj === 'object' &&
        obj !== null &&
        'data' in obj
    ) {
        const data = (obj as { data?: unknown }).data;
        if (typeof data === 'object' && data !== null && 'awb_number' in data) {
            return typeof (data as { awb_number?: unknown }).awb_number === 'string';
        }
    }
    return false;
}

export async function getOrderShippingStatus(orderId: number) {
    if (isNaN(orderId)) {
        logMessage('warn', 'Invalid order ID', { orderId });
        return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const orderResult = await getOrderById(orderId);
    if (!orderResult?.status) {
        logMessage('warn', 'Order not found', { orderId });
        return NextResponse.json({ status: false, message: 'Order not found' }, { status: 404 });
    }

    const order = orderResult.order;

    if (!order) {
        logMessage('warn', 'Order not found for orderId', { orderId });
        return NextResponse.json({ status: false, message: 'Order not found' }, { status: 404 });
    }

    let orderAWBNumber = '';

    try {
        if (isShippingApiResult(order.shippingApiResult)) {
            orderAWBNumber = order.shippingApiResult.data.awb_number || '';
        }

        if (!orderAWBNumber) {
            orderAWBNumber = order.awbNumber || '';
        }

        logMessage(`debug`, `orderAWBNumber:`, orderAWBNumber);
    } catch (e) {
        logMessage('error', 'Error while extracting awb_number', { error: e });
        return NextResponse.json({ status: false, message: 'Invalid shipping data format' }, { status: 500 });
    }

    if (!orderAWBNumber) {
        logMessage('warn', 'No AWB number found for order', { orderId });
        return NextResponse.json({ status: false, message: 'No AWB number found for order' }, { status: 404 });
    }

    try {
        const myHeaders = new Headers();
        myHeaders.append("access-token", "ODQxODRmNzljNDAwYzYwMjZhNWU1YWFkNmY4MDJhMDE5ZTNiOjg5NjhlOWI5OGJhZTljODhjZmNiNmQ3M2I2YTkyZmM1MzQyNzEyYTU5ZTM3MDA5NWMxZWFhZjNiNGNhNDI3ZTY4YzY4YWNmMzMyZDFjOTQ4ZDA1OTgyMWE3OTk1MWFiZGMwZTQzZTU1OTQ4Nw==");

        const requestOptions: RequestInit = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        // 13630911339376
        const response = await fetch(`https://app.parcelx.in/api/v1/track_order?awb=${orderAWBNumber}`, requestOptions);
        const trackingData = await response.json();

        logMessage('info', 'Fetched tracking status from ParcelX', { awb: orderAWBNumber, trackingData });

        return NextResponse.json({
            status: true,
            message: 'Tracking data fetched successfully',
            awb_number: orderAWBNumber,
            trackingData
        }, { status: 200 });

    } catch (error) {
        logMessage('error', 'Failed to fetch tracking status', { error, awb: orderAWBNumber });
        return NextResponse.json({
            status: false,
            message: 'Failed to fetch tracking data',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
