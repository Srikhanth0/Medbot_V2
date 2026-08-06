import json
import logging
import uuid
from typing import Optional, Dict, Any, List

import asyncpg
from app.db.client import db_client

logger = logging.getLogger(__name__)


async def get_valid_pool(pool: Optional[asyncpg.Pool]) -> Optional[asyncpg.Pool]:
    """Helper to ensure we have a valid pool or attempt connection."""
    if pool is not None:
        return pool
    return await db_client.get_pool()


async def insert_user_profile(
    pool: Optional[asyncpg.Pool] = None, 
    clerk_user_id: Optional[str] = None,
    user_id: Optional[str] = None, 
    full_name: Optional[str] = None,
    **kwargs
) -> Optional[str]:
    """
    Upsert a user profile into the 'profiles' table.
    The profiles table schema is: id (uuid PK), full_name, date_of_birth, created_at, updated_at.
    The 'id' column IS the user's UUID identity.
    """
    target_user_id = user_id or clerk_user_id or "user_dev_anonymous"

    # Generate a deterministic UUID from the clerk_user_id string
    # so the same user always gets the same UUID.
    if target_user_id.startswith("user_"):
        user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, target_user_id))
    else:
        # If it's already a valid UUID, use it directly
        try:
            uuid.UUID(target_user_id)
            user_uuid = target_user_id
        except ValueError:
            user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, target_user_id))

    # Supabase REST: upsert into profiles with the user UUID as id
    try:
        supabase = db_client.get_supabase_admin()
        payload: Dict[str, Any] = {"id": user_uuid}
        if full_name:
            payload["full_name"] = full_name
        res = supabase.table("profiles").upsert(payload, on_conflict="id").execute()
        if res.data and len(res.data) > 0:
            return str(res.data[0]["id"])
    except Exception as e:
        logger.debug("Profiles upsert failed (non-critical): %s", e)

    return user_uuid


async def upsert_user_profile(pool: Optional[asyncpg.Pool] = None, clerk_user_id: Optional[str] = None, user_id: Optional[str] = None, **kwargs) -> Optional[str]:
    return await insert_user_profile(
        pool=pool,
        clerk_user_id=clerk_user_id or user_id,
        full_name=kwargs.get('full_name'),
    )


async def resolve_user_uuid(pool: Optional[asyncpg.Pool] = None, clerk_user_id: Optional[str] = None, user_id: Optional[str] = None) -> str:
    """Resolve a clerk_user_id or user_id string to a stable UUID for the profiles table."""
    target_id = clerk_user_id or user_id or "user_dev_anonymous"
    user_uuid = await upsert_user_profile(pool, target_id)
    if not user_uuid:
        user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, target_id))
    return user_uuid


async def insert_report(
    pool: Optional[asyncpg.Pool] = None, 
    clerk_user_id: Optional[str] = None, 
    user_id: Optional[str] = None,
    storage_path: str = "", 
    report_type: Optional[str] = None,
    **kwargs
) -> Optional[str]:
    target_id = clerk_user_id or user_id or "user_dev_anonymous"
    user_uuid = await resolve_user_uuid(pool, target_id)
    active_pool = await get_valid_pool(pool)

    if active_pool:
        query = """
            INSERT INTO reports (user_id, storage_path, report_type)
            VALUES ($1::uuid, $2, $3)
            RETURNING id;
        """
        try:
            async with active_pool.acquire() as conn:
                report_id = await conn.fetchval(query, user_uuid, storage_path, report_type)
                return str(report_id) if report_id else None
        except Exception:
            pass

    try:
        supabase = db_client.get_supabase_admin()
        payload = {
            "user_id": user_uuid,
            "storage_path": storage_path,
        }
        if report_type:
            payload["report_type"] = report_type
        res = supabase.table("reports").insert(payload).execute()
        if res.data and len(res.data) > 0:
            return str(res.data[0]["id"])
    except Exception:
        pass

    return str(uuid.uuid4())


async def update_report_status(
    pool: Optional[asyncpg.Pool] = None, 
    report_id: str = "", 
    status: str = "processing", 
    parser_used: Optional[str] = None,
    **kwargs
) -> None:
    active_pool = await get_valid_pool(pool)
    if active_pool:
        query = """
            UPDATE reports
            SET status = $2, parser_used = COALESCE($3, parser_used)
            WHERE id = $1::uuid;
        """
        try:
            async with active_pool.acquire() as conn:
                await conn.execute(query, report_id, status, parser_used)
                return
        except Exception:
            pass

    try:
        supabase = db_client.get_supabase_admin()
        update_data = {"status": status}
        if parser_used:
            update_data["parser_used"] = parser_used
        supabase.table("reports").update(update_data).eq("id", report_id).execute()
    except Exception:
        pass


async def get_report(pool: Optional[asyncpg.Pool] = None, report_id: str = "") -> Optional[Dict[str, Any]]:
    active_pool = await get_valid_pool(pool)
    if active_pool:
        query = "SELECT * FROM reports WHERE id = $1::uuid;"
        try:
            async with active_pool.acquire() as conn:
                row = await conn.fetchrow(query, report_id)
                return dict(row) if row else None
        except Exception:
            pass

    try:
        supabase = db_client.get_supabase_admin()
        res = supabase.table("reports").select("*").eq("id", report_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception:
        pass

    return None


async def get_user_reports(pool: Optional[asyncpg.Pool] = None, clerk_user_id: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    target_id = clerk_user_id or user_id or "user_dev_anonymous"
    user_uuid = await resolve_user_uuid(pool, target_id)
    active_pool = await get_valid_pool(pool)
    if active_pool:
        query = "SELECT * FROM reports WHERE user_id = $1::uuid ORDER BY created_at DESC;"
        try:
            async with active_pool.acquire() as conn:
                rows = await conn.fetch(query, user_uuid)
                return [dict(r) for r in rows]
        except Exception:
            pass

    try:
        supabase = db_client.get_supabase_admin()
        res = supabase.table("reports").select("*").eq("user_id", user_uuid).order("created_at", desc=True).execute()
        return res.data or []
    except Exception:
        pass

    return []


async def insert_chunks_batch(pool: Optional[asyncpg.Pool] = None, chunks: List[Dict[str, Any]] = None) -> None:
    if not chunks:
        return
    active_pool = await get_valid_pool(pool)
    if active_pool:
        query = """
            INSERT INTO report_chunks (
                report_id, parent_chunk_id, chunk_type, section, page_number, 
                bbox, loinc_code, is_abnormal, content, embedding, token_count
            )
            VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11);
        """
        formatted_chunks = []
        for c in chunks:
            bbox_json = json.dumps(c.get('bbox')) if c.get('bbox') else None
            embedding = c.get('embedding')
            embedding_str = f"[{','.join(map(str, embedding))}]" if embedding else None
            
            formatted_chunks.append((
                c['report_id'],
                c.get('parent_chunk_id'),
                c.get('chunk_type'),
                c.get('section'),
                c.get('page_number'),
                bbox_json,
                c.get('loinc_code'),
                c.get('is_abnormal'),
                c['content'],
                embedding_str,
                c.get('token_count')
            ))
            
        try:
            async with active_pool.acquire() as conn:
                await conn.executemany(query, formatted_chunks)
                return
        except Exception:
            pass

    try:
        supabase = db_client.get_supabase_admin()
        clean_chunks = []
        for c in chunks:
            cleaned = {k: v for k, v in c.items() if v is not None}
            clean_chunks.append(cleaned)
        supabase.table("report_chunks").insert(clean_chunks).execute()
    except Exception:
        pass


async def create_conversation(
    pool: Optional[asyncpg.Pool] = None, 
    clerk_user_id: Optional[str] = None, 
    user_id: Optional[str] = None,
    report_id: Optional[str] = None, 
    title: Optional[str] = None,
    **kwargs
) -> str:
    target_id = user_id or clerk_user_id or "user_dev_anonymous"
    user_uuid = await resolve_user_uuid(pool, target_id)
    report_uuid = report_id if report_id else None
    active_pool = await get_valid_pool(pool)

    if active_pool:
        query = """
            INSERT INTO conversations (user_id, report_id, title)
            VALUES ($1::uuid, $2::uuid, $3)
            RETURNING id;
        """
        try:
            async with active_pool.acquire() as conn:
                conv_id = await conn.fetchval(query, user_uuid, report_uuid, title or "New Medical Chat")
                if conv_id:
                    return str(conv_id)
        except Exception:
            pass

    # Supabase REST fallback: try 'chats' table first, then 'conversations'
    try:
        supabase = db_client.get_supabase_admin()
        payload = {
            "user_id": user_uuid,
            "title": title or "New Medical Chat"
        }
        res = supabase.table("chats").insert(payload).execute()
        if res.data and len(res.data) > 0:
            return str(res.data[0]["id"])
    except Exception:
        try:
            supabase = db_client.get_supabase_admin()
            payload = {
                "user_id": user_uuid,
                "title": title or "New Medical Chat"
            }
            if report_uuid:
                payload["report_id"] = report_uuid
            res = supabase.table("conversations").insert(payload).execute()
            if res.data and len(res.data) > 0:
                return str(res.data[0]["id"])
        except Exception:
            pass

    return str(uuid.uuid4())


async def get_conversation(pool: Optional[asyncpg.Pool] = None, conversation_id: str = "") -> Optional[Dict[str, Any]]:
    active_pool = await get_valid_pool(pool)
    if active_pool:
        query_conv = "SELECT * FROM conversations WHERE id = $1::uuid;"
        query_msgs = "SELECT * FROM messages WHERE conversation_id = $1::uuid ORDER BY created_at ASC;"
        try:
            async with active_pool.acquire() as conn:
                conv = await conn.fetchrow(query_conv, conversation_id)
                if conv:
                    conv_dict = dict(conv)
                    messages = await conn.fetch(query_msgs, conversation_id)
                    conv_dict['messages'] = [dict(m) for m in messages]
                    return conv_dict
        except Exception:
            pass

    try:
        supabase = db_client.get_supabase_admin()
        conv_res = supabase.table("chats").select("*").eq("id", conversation_id).execute()
        if not conv_res.data:
            conv_res = supabase.table("conversations").select("*").eq("id", conversation_id).execute()

        if conv_res.data and len(conv_res.data) > 0:
            conv_dict = conv_res.data[0]
            msg_res = supabase.table("messages").select("*").eq("chat_id", conversation_id).order("created_at", desc=False).execute()
            conv_dict["messages"] = msg_res.data or []
            return conv_dict
    except Exception:
        pass

    return None


async def get_user_conversations(pool: Optional[asyncpg.Pool] = None, clerk_user_id: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    target_id = clerk_user_id or user_id or "user_dev_anonymous"
    user_uuid = await resolve_user_uuid(pool, target_id)
    active_pool = await get_valid_pool(pool)
    if active_pool:
        query = "SELECT * FROM conversations WHERE user_id = $1::uuid ORDER BY updated_at DESC;"
        try:
            async with active_pool.acquire() as conn:
                rows = await conn.fetch(query, user_uuid)
                return [dict(r) for r in rows]
        except Exception:
            pass

    try:
        supabase = db_client.get_supabase_admin()
        res = supabase.table("chats").select("*").eq("user_id", user_uuid).order("created_at", desc=True).execute()
        if not res.data:
            res = supabase.table("conversations").select("*").eq("user_id", user_uuid).order("updated_at", desc=True).execute()
        return res.data or []
    except Exception:
        pass

    return []


async def insert_message(
    pool: Optional[asyncpg.Pool] = None, 
    conversation_id: str = "", 
    role: str = "user", 
    content: str = "", 
    citations: Optional[Any] = None, 
    safety_event: Optional[str] = None, 
    confidence: Optional[str] = None,
    user_id: Optional[str] = None,
    **kwargs
) -> str:
    target_id = user_id or "user_dev_anonymous"
    user_uuid = await resolve_user_uuid(pool, target_id)
    active_pool = await get_valid_pool(pool)
    citations_json = json.dumps(citations) if citations else None
    
    if active_pool:
        query_msg = """
            INSERT INTO messages (conversation_id, role, content, citations, safety_event, confidence)
            VALUES ($1::uuid, $2, $3, $4::jsonb, $5, $6)
            RETURNING id;
        """
        try:
            async with active_pool.acquire() as conn:
                async with conn.transaction():
                    msg_id = await conn.fetchval(
                        query_msg, conversation_id, role, content, citations_json, safety_event, confidence
                    )
                    return str(msg_id)
        except Exception:
            pass

    # Supabase REST fallback (populating chat_id + user_id)
    try:
        supabase = db_client.get_supabase_admin()
        payload: Dict[str, Any] = {
            "user_id": user_uuid,
            "chat_id": conversation_id,
            "role": role,
            "content": content,
        }
        if citations is not None:
            payload["rag_sources"] = json.dumps(citations) if isinstance(citations, (dict, list)) else str(citations)
        payload["model_used"] = "thinkingmachines/inkling"

        res = supabase.table("messages").insert(payload).execute()
        if res.data and len(res.data) > 0:
            return str(res.data[0]["id"])
    except Exception as primary_err:
        logger.warning("Primary Supabase insert_message failed: %s", primary_err)

    return str(uuid.uuid4())


async def get_recent_messages(
    pool: Optional[asyncpg.Pool] = None, 
    conversation_id: str = "", 
    limit: int = 10
) -> List[Dict[str, Any]]:
    active_pool = await get_valid_pool(pool)
    if active_pool:
        query = """
            SELECT * FROM (
                SELECT * FROM messages 
                WHERE conversation_id = $1::uuid 
                ORDER BY created_at DESC 
                LIMIT $2
            ) sub
            ORDER BY created_at ASC;
        """
        try:
            async with active_pool.acquire() as conn:
                rows = await conn.fetch(query, conversation_id, limit)
                return [dict(r) for r in rows]
        except Exception:
            pass

    try:
        supabase = db_client.get_supabase_admin()
        res = supabase.table("messages").select("*").eq("chat_id", conversation_id).order("created_at", desc=True).limit(limit).execute()
        items = res.data or []
        return list(reversed(items))
    except Exception:
        pass

    return []


async def update_rolling_summary(
    pool: Optional[asyncpg.Pool] = None, 
    conversation_id: str = "", 
    summary: str = ""
) -> None:
    active_pool = await get_valid_pool(pool)
    if active_pool:
        query = "UPDATE conversations SET rolling_summary = $2, updated_at = now() WHERE id = $1::uuid;"
        try:
            async with active_pool.acquire() as conn:
                await conn.execute(query, conversation_id, summary)
                return
        except Exception:
            pass

    try:
        supabase = db_client.get_supabase_admin()
        supabase.table("chats").update({"title": summary[:50]}).eq("id", conversation_id).execute()
    except Exception:
        pass


async def insert_audit_log(
    pool: Optional[asyncpg.Pool] = None, 
    user_id: Optional[str] = None, 
    action: str = "", 
    resource_type: Optional[str] = None, 
    resource_id: Optional[str] = None, 
    metadata: Optional[Dict[str, Any]] = None,
    **kwargs
) -> None:
    active_pool = await get_valid_pool(pool)
    meta_json = json.dumps(metadata) if metadata else None
    if active_pool:
        query = """
            INSERT INTO audit_log (user_id, action, resource_type, resource_id, metadata)
            VALUES ($1::uuid, $2, $3, $4::uuid, $5::jsonb);
        """
        try:
            async with active_pool.acquire() as conn:
                await conn.execute(query, user_id, action, resource_type, resource_id, meta_json)
                return
        except Exception:
            pass

    try:
        supabase = db_client.get_supabase_admin()
        payload: Dict[str, Any] = {
            "action": action,
        }
        if user_id:
            payload["user_id"] = user_id
        if resource_type:
            payload["resource_type"] = resource_type
        if resource_id:
            payload["resource_id"] = resource_id
        if metadata:
            payload["metadata"] = metadata
        supabase.table("audit_log").insert(payload).execute()
    except Exception:
        pass
