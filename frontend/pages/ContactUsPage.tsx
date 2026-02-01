
import React, { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Send, MessageSquare, ShieldCheck, CheckCircle2, MessageCircle } from 'lucide-react';

export const ContactUsPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-dark py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h4 className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4">Support Center</h4>
          <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tighter">Get in <span className="text-primary">Touch</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto mt-6 text-lg">
            Have questions about your order or our services? Our dedicated support team is here to assist you.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 -mt-16 relative z-20 contact-us-content">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8">
              <h3 className="text-2xl font-bold tracking-tight text-dark">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex gap-5 group">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <Mail size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Us</p>
                    <a href="mailto:fzokart@gmail.com" className="text-lg font-bold text-dark hover:text-primary transition-colors">fzokartshop@gmail.com</a>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <Phone size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Call Support</p>
                    <a href="tel:+917636067699" className="text-lg font-bold text-dark hover:text-primary transition-colors">+91 7636067699</a>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#25D366] group-hover:text-white transition-all">
                    <MessageCircle size={22} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">WhatsApp Chat</p>
                    <a
                      href="https://wa.me/917636067699"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-dark hover:text-[#25D366] transition-colors"
                    >
                      Instant Message Now
                    </a>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                    <Clock size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Support Hours</p>
                    <p className="text-lg font-bold text-dark">Mon to Sat — 9 AM to 7 PM</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Office Address</p>
                    <div className="text-lg font-bold text-dark leading-tight">
                      Contact Us <br />
                      Moirabari, Morigaon <br />
                      Assam, India
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Support Team" />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-gray-400">Our support team is active now.</p>
              </div>
            </div>

            <a
              href="https://wa.me/917636067699"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] p-8 rounded-[2.5rem] text-white flex items-center justify-between group cursor-pointer overflow-hidden relative shadow-lg shadow-[#25D366]/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h4 className="font-bold text-xl">Chat with us on WhatsApp</h4>
                <p className="text-white/70 text-sm">Instant response from our support team</p>
              </div>
              <MessageCircle className="group-hover:scale-110 transition-transform" size={32} fill="currentColor" />
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-10 lg:p-16 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
              {isSubmitted ? (
                <div className="text-center py-20 space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-dark">Message Sent!</h2>
                  <p className="text-gray-500 text-lg max-w-md mx-auto">
                    Thank you for reaching out. We've received your inquiry and will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-dark text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-dark mb-2">Send us a Message</h2>
                    <p className="text-gray-500">Fill out the form below and we'll respond as soon as possible.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input required type="text" placeholder="Rahul Sharma" className="w-full bg-lightGray/50 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 transition-all font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input required type="email" placeholder="rahul@example.com" className="w-full bg-lightGray/50 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 transition-all font-semibold" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                      <select className="w-full bg-lightGray/50 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 transition-all font-semibold">
                        <option>Order Tracking</option>
                        <option>Returns & Refunds</option>
                        <option>Product Inquiry</option>
                        <option>Technical Support</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                      <textarea required rows={5} placeholder="How can we help you today?" className="w-full bg-lightGray/50 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/20 transition-all font-semibold resize-none"></textarea>
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button type="submit" className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/30">
                        Send Message <Send size={20} />
                      </button>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <ShieldCheck size={14} /> End-to-end Encrypted Support
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Map Section Visual */}
      <section className="container mx-auto px-4 pb-20">
        <div className="h-[400px] w-full bg-lightGray rounded-[4rem] relative overflow-hidden group">
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1600"
            className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 transition-all duration-1000"
            alt="Office Location"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 text-center animate-bounce-slow">
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} />
              </div>
              <h4 className="font-bold text-dark mb-1">Visit Our Office</h4>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Morigaon, Assam</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
