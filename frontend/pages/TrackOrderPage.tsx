import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { Layout } from '../components/Layout';
import { useSocket } from '../hooks/useSocket';
import { CheckCircle, Package, Truck, MapPin, Clock } from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const socket = useSocket(null);

  const fetchTrackingInfo = async () => {
    try {
      const { data } = await API.get(`/api/tracking/${trackingId}`);
      setTrackingData(data.data);
      setLoading(false);
    } catch (err) {
      setError('Tracking information not found. Please check your Tracking ID.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingId) {
      fetchTrackingInfo();
    } else {
      setLoading(false);
      setError('No Tracking ID provided. Please check your link or go to your orders.');
    }
  }, [trackingId]);

  // Real-time updates
  useEffect(() => {
    if (socket && trackingData) {
      socket.on('notification', (data: any) => {
        if (data.type === 'orderStatusUpdate') {
          // In a real app we'd check if this update belongs to THIS order
          // For now, simple refresh
          fetchTrackingInfo();
        }
      });
      return () => {
        socket.off('notification');
      };
    }
  }, [socket, trackingData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Tracking Failed</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <a href="/" className="inline-block bg-[#2874F0] text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const steps = [
    { label: 'Order Confirmed', status: 'PENDING', icon: CheckCircle, date: trackingData.events.find((e: any) => e.status === 'Order Placed')?.date },
    { label: 'Packed', status: 'PACKED', icon: Package, date: trackingData.events.find((e: any) => e.status === 'Packed')?.date },
    { label: 'Shipped', status: 'SHIPPED', icon: Truck, date: trackingData.events.find((e: any) => e.status === 'Shipped')?.date },
    { label: 'Out for Delivery', status: 'OUT_FOR_DELIVERY', icon: Truck, date: trackingData.events.find((e: any) => e.status === 'Out for Delivery')?.date },
    { label: 'Delivered', status: 'DELIVERED', icon: CheckCircle, date: trackingData.events.find((e: any) => e.status === 'Delivered')?.date },
  ];

  const getCurrentStepIndex = () => {
    const status = trackingData.status;
    const statusMap: Record<string, number> = {
      'PENDING': 0, 'PAID': 0,
      'PACKED': 1, 'PROCESSING': 1,
      'SHIPPED': 2,
      'OUT_FOR_DELIVERY': 3,
      'DELIVERED': 4
    };
    return statusMap[status] ?? 0;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-[#2874F0] p-6 text-white flex justify-between items-center">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Tracking ID</p>
              <h1 className="text-2xl font-bold font-mono">{trackingData.trackingId}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Order Status</p>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <Clock size={14} />
                <span className="font-bold text-sm capitalize">{trackingData.status.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col gap-8">
              {/* Visual Stepper */}
              <div className="relative flex flex-col md:flex-row justify-between w-full">
                {/* Connecting Line */}
                <div className="absolute top-4 left-4 md:left-0 md:top-1/2 md:-translate-y-1/2 w-0.5 md:w-full h-full md:h-1 bg-gray-200 -z-10"></div>
                <div
                  className="absolute top-4 left-4 md:left-0 md:top-1/2 md:-translate-y-1/2 w-0.5 md:w-full h-full md:h-1 bg-[#4CBB76] -z-10 transition-all duration-1000 origin-left"
                  style={{
                    height: window.innerWidth < 768 ? `${currentStep * 25}%` : '4px',
                    width: window.innerWidth >= 768 ? `${currentStep * 25}%` : '2px'
                  }}
                ></div>

                {steps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={index} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10 bg-white md:bg-transparent p-2 md:p-0 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-[#4CBB76] border-[#4CBB76] text-white' : 'bg-white border-gray-300 text-gray-300'
                        } ${isCurrent ? 'ring-4 ring-[#4CBB76]/20 scale-110' : ''}`}>
                        <step.icon size={14} />
                      </div>
                      <div className="md:text-center">
                        <p className={`text-sm font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                        {step.date && <p className="text-xs text-gray-500">{new Date(step.date).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr className="border-gray-100" />

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Shipping From</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Fzokart Pvt. Ltd.</p>
                      <p className="text-sm text-gray-500">{trackingData.shippingFrom}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Shipping To</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Destination</p>
                      <p className="text-sm text-gray-500">{trackingData.shippingTo}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a href="/" className="text-sm font-bold text-gray-400 hover:text-[#2874F0] transition-colors">
            Back to Shop
          </a>
        </div>
      </div>
    </div>
  );
};
