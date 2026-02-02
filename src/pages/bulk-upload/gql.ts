export const UploadFidusiaData = `
  query UploadFidusiaData($args: dmaas_import_data_fidusia_args!) {
    dmaas {
      import_data_fidusia(args: $args) {
        results
      }
    }
  }
`;

export const GetUploadedRecords = `
  query GetUploadedRecords($where: dmaas_pendaftaran_bool_exp, $order_by: [dmaas_pendaftaran_order_by!], $limit: Int, $offset: Int) {
    dmaas {
      pendaftaran(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
        id
        batch_id
        no_perjanjian
        tgl_awal_perjanjian
        debitur {
          nama
        }
        obyek {
          merk
          tipe
          no_mesin
          no_rangka
        }
        nilai_penjaminan
        status {
          id
          nama
        }
        created_date
      }
    }
  }
`;

export const GetNotaries = `
  query GetNotaries {
    dmaas {
      notaris {
        id
        nama
        last_akta_no
      }
    }
  }
`;

export const AssignNotaryMutation = `
  mutation AssignNotary($id: uuid!, $notaris_id: uuid!) {
    dmaas {
      update_pendaftaran_by_pk(pk_columns: { id: $id }, _set: { notaris_id: $notaris_id }) {
        id
        notaris_id
      }
    }
  }
`;

export const BulkAssignNotaryMutation = `
  query AssignNotaries($args: dmaas_assign_notaris_json_base_quantity_args!) {
    dmaas {
      assign_notaris_json_base_quantity(args: $args) {
        results
      }
    }
  }
`;

export const GetPendingBatches = `
  query GetPendingBatches {
    dmaas {
      legalisasi(distinct_on: batch_id, order_by: { batch_id: desc, created_date: desc }) {
        batch_id
        created_date
      }
    }
  }
`;

export const GetBatchStats = `
  query GetBatchStats($batch_id: uuid!) {
    dmaas {
      total: legalisasi_aggregate(where: { batch_id: { _eq: $batch_id } }) {
        aggregate {
          count
        }
      }
      assigned: legalisasi_aggregate(
        where: { batch_id: { _eq: $batch_id }, status: { nama: { _eq: "Assigned" } } }
      ) {
        aggregate {
          count
        }
      }
      failed: legalisasi_aggregate(
        where: { batch_id: { _eq: $batch_id }, status: { nama: { _eq: "Failed" } } }
      ) {
        aggregate {
          count
        }
      }
      processing_check: legalisasi_aggregate(
        where: { batch_id: { _eq: $batch_id }, fidusia_check_status: { _eq: "processing" } }
      ) {
        aggregate {
          count
        }
      }
      completed_check: legalisasi_aggregate(
        where: { batch_id: { _eq: $batch_id }, fidusia_check_status: { _eq: "completed" } }
      ) {
        aggregate {
          count
        }
      }
      failed_check: legalisasi_aggregate(
        where: { batch_id: { _eq: $batch_id }, fidusia_check_status: { _eq: "failed" } }
      ) {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GetFailedRecords = `
  query GetFailedRecords($batch_id: uuid!) {
    dmaas {
      legalisasi(where: { batch_id: { _eq: $batch_id }, status: { nama: { _eq: "Failed" } } }) {
        id
        batch_id
        nomor_kontrak
        nama_debitur
        nomor_rangka
        nomor_mesin
        merk
        type
        nilai_penjaminan
        tgl_awal_perjanjian
        notes
        created_date
      }
    }
  }
`;

export const RETRY_FAILED_CHECKS = `
  mutation RetryFailedChecks($batch_id: uuid!) {
    retryFailedFidusiaChecks(batch_id: $batch_id) {
      batch_id
      message
      retried_count
      task_ids
      total_failed
      debug_info {
        legalisasi_id
        nomor_rangka
        obyek_id
        pendaftaran_id
        steps
      }
    }
  }
`;
