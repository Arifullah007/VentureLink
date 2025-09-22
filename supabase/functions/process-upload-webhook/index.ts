// Follow this guide to debug functions locally:
// https://supabase.com/docs/guides/functions/tooling#local-debugging

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Stub for OCR/Text extraction. Replace with a real service if desired.
async function extractTextFromPdf(fileBuffer: ArrayBuffer): Promise<string> {
    // In a real implementation, you would use a library or API for OCR.
    // For this stub, we'll do a very basic text search on the buffer.
    const textDecoder = new TextDecoder();
    const content = textDecoder.decode(fileBuffer);

    // This is a naive implementation and will only work for text-based PDFs.
    // For image-based PDFs, a real OCR service is needed.
    console.log("Extracted text (stub):", content.substring(0, 200));
    return content;
}

// Stub for watermarking. Replace with a real image/PDF manipulation library.
async function applyWatermark(fileBuffer: ArrayBuffer, text: string): Promise<ArrayBuffer> {
    console.log(`Applying watermark: "${text}" (stub)`);
    // In a real app, use a library like `pdf-lib` for PDFs or `sharp` for images.
    // This stub just returns the original file buffer.
    return fileBuffer;
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    const fileRecord = payload.record;

    // Idempotency check: if already processed, skip.
    if (fileRecord.watermarked || fileRecord.quarantined) {
        console.log(`File ${fileRecord.id} already processed. Skipping.`);
        return new Response(JSON.stringify({ message: "Already processed" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // 1. Download the uploaded file
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('pitch-uploads')
      .download(fileRecord.file_path);

    if (downloadError) throw downloadError;

    const fileBuffer = await fileData.arrayBuffer();

    // 2. Process file content for contact info
    const extractedText = await extractTextFromPdf(fileBuffer);
    const contactRegex = /(\w+@\w+\.\w+)|(\+?\d[\d -]{8,12}\d)|(https?:\/\/[^\s]+)/;
    const hasContactInfo = contactRegex.test(extractedText);

    if (hasContactInfo) {
      // 3a. Quarantine the file
      const quarantinePath = `quarantined/${fileRecord.file_path}`;
      const { error: moveError } = await supabaseAdmin.storage
        .from('pitch-uploads').move(fileRecord.file_path, quarantinePath);

      if (moveError) throw new Error(`Failed to move file to quarantine: ${moveError.message}`);

      // Update the pitch_files record to mark as quarantined
      await supabaseAdmin.from('pitch_files').update({
        quarantined: true,
        has_contact_info: true
      }).eq('id', fileRecord.id);

      // Create a report
      await supabaseAdmin.from('reports').insert({
        report_type: 'contact_info_in_file',
        description: `Contact info found in file: ${fileRecord.file_name}`,
        related_pitch_id: fileRecord.pitch_id,
      });

      console.log(`File ${fileRecord.file_name} quarantined.`);

    } else {
      // 3b. Watermark and move the file
      const { data: pitch } = await supabaseAdmin.from('pitches').select('entrepreneur_id').eq('id', fileRecord.pitch_id).single();
      const watermarkText = `VentureLink | Pitch ID: ${fileRecord.pitch_id} | User: ${pitch?.entrepreneur_id}`;
      
      const watermarkedBuffer = await applyWatermark(fileBuffer, watermarkText);

      // Upload watermarked file to a secure, private bucket
      const watermarkedPath = `processed/${fileRecord.file_path}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('watermarked-files')
        .upload(watermarkedPath, watermarkedBuffer, { contentType: fileData.type });
        
      if(uploadError) throw new Error(`Failed to upload watermarked file: ${uploadError.message}`);

      // Update the pitch_files record
      await supabaseAdmin.from('pitch_files').update({
        watermarked: true,
        watermarked_path: watermarkedPath,
      }).eq('id', fileRecord.id);

      // Clean up original upload
      await supabaseAdmin.storage.from('pitch-uploads').remove([fileRecord.file_path]);

      console.log(`File ${fileRecord.file_name} watermarked and processed.`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
