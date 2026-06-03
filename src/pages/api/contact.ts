import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const name = data.get('name')?.toString() || '';
    const email = data.get('email')?.toString() || '';
    const type = data.get('type')?.toString() || '';
    const message = data.get('message')?.toString() || '';

    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500 });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: 'Goldfishstudio Website <website@goldfishstudio.nl>',
      to: ['info@goldfishstudio.nl'],
      replyTo: email,
      subject: `Website: ${type || 'New message'} from ${name}`,
      text: `New message from goldfishstudio.nl contact form

Name: ${name}
Email: ${email}
Project type: ${type}

Message:
${message}

---
Sent from Goldfishstudio website`,
      html: `
        <h2 style="font-family:Georgia,serif;color:#c4a46e">New message from Goldfishstudio website</h2>
        <table style="border-collapse:collapse;font-family:sans-serif">
          <tr><td style="padding:4px 12px 4px 0;font-weight:600;color:#888">Name</td><td style="padding:4px 0">${name}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:600;color:#888">Email</td><td style="padding:4px 0">${email}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:600;color:#888">Type</td><td style="padding:4px 0">${type || '-'}</td></tr>
        </table>
        <h3 style="font-family:Georgia,serif;color:#f5f0eb;margin-top:24px">Message</h3>
        <p style="font-family:sans-serif;color:#a09888;line-height:1.8">${message.replace(/\n/g, '<br>')}</p>
        <hr style="border:none;border-top:1px solid #2a2520;margin-top:32px">
        <p style="color:#6a6358;font-size:12px">Sent from goldfishstudio.nl contact form</p>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
