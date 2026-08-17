-- Add PDF manuscript metadata to research entries
alter table research
  add column pdf_storage_path text,
  add column pdf_filename text,
  add column pdf_size_bytes bigint,
  add column pdf_mime_type text;

-- Replace the existing research status constraint
alter table research
  drop constraint if exists research_status_check;

alter table research
  add constraint research_status_check
  check (
    status in (
      'draft',
      'researching',
      'review',
      'preprint',
      'submitted',
      'under_review',
      'accepted',
      'published',
      'rejected',
      'archived'
    )
  );