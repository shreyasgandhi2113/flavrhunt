import React, { useState, useEffect } from 'react';
import type { Recipe } from '../../types';
import { useApp } from '../../context/AppContext';
import { addReport } from '../../utils/adminUtils';

interface RecipeDetailModalProps {
    recipe: Recipe;
    onClose: () => void;
    viewMode?: 'user' | 'admin';
}

interface Reply {
    replyId: string;
    userId: string;
    username: string;
    text: string;
    createdAt: number;
}
interface Comment {
    commentId: string;
    recipeId: string;
    userId: string;
    username: string;
    text: string;
    createdAt: number;
    replies: Reply[];
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose, viewMode = 'user' }) => {
    const { toggleLike, toggleWatchLater, currentUser, rateRecipe, isFeatureDisabled } = useApp();

    const isLiked = currentUser?.likedRecipes.includes(recipe.id);
    const isWatchLater = currentUser?.watchLaterRecipes.includes(recipe.id);
    const userRating = currentUser ? (recipe.ratings[currentUser.id] || 0) : 0;

    // Cooking Mode State
    const [isCookingMode, setIsCookingMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const rawSteps = recipe.process.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    let stepsArray = rawSteps;
    if (rawSteps.length === 1) {
        const splitByNum = rawSteps[0].split(/(?=\d+\.)/).map(s => s.trim()).filter(s => s.length > 0);
        if (splitByNum.length > 1) {
            stepsArray = splitByNum;
        }
    }

    // Comments State
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState("");

    // Report State
    const [reportTarget, setReportTarget] = useState<{ type: 'recipe' | 'comment' | 'user', id: string, name: string } | null>(null);
    const [reportReason, setReportReason] = useState("");

    const handleSubmitReport = () => {
        if (!currentUser || !reportTarget || !reportReason.trim()) return;
        addReport(reportTarget.type, reportTarget.id, reportTarget.name, currentUser.username, reportReason.trim());
        alert("Report submitted successfully.");
        setReportTarget(null);
        setReportReason("");
    };

    useEffect(() => {
        const loadComments = () => {
            try {
                const stored = localStorage.getItem('flavrComments');
                if (stored) {
                    const allComments: Comment[] = JSON.parse(stored);
                    setComments(allComments.filter(c => c.recipeId === recipe.id));
                }
            } catch (e) { }
        };
        loadComments();
    }, [recipe.id]);

    const saveComments = (newCommentsList: Comment[]) => {
        try {
            const stored = localStorage.getItem('flavrComments');
            let allComments: Comment[] = stored ? JSON.parse(stored) : [];
            allComments = allComments.filter(c => c.recipeId !== recipe.id);
            allComments = [...allComments, ...newCommentsList];
            localStorage.setItem('flavrComments', JSON.stringify(allComments));
            setComments(newCommentsList);
        } catch (e) { }
    };

    const handleAddComment = () => {
        if (!currentUser || !newComment.trim() || newComment.length > 300) return;
        const newC: Comment = {
            commentId: Date.now().toString(),
            recipeId: recipe.id,
            userId: currentUser.id,
            username: currentUser.username,
            text: newComment.trim(),
            createdAt: Date.now(),
            replies: []
        };
        saveComments([...comments, newC]);
        setNewComment("");
    };

    const handleAddReply = (commentId: string) => {
        if (!currentUser || !replyText.trim() || replyText.length > 300) return;
        const updated = comments.map(c => {
            if (c.commentId === commentId) {
                const newReply: Reply = {
                    replyId: Date.now().toString(),
                    userId: currentUser.id,
                    username: currentUser.username,
                    text: replyText.trim(),
                    createdAt: Date.now()
                };
                return { ...c, replies: [...c.replies, newReply] };
            }
            return c;
        });
        saveComments(updated);
        setReplyingTo(null);
        setReplyText("");
    };

    const handleDeleteComment = (commentId: string) => {
        saveComments(comments.filter(c => c.commentId !== commentId));
    };

    const handleEditComment = (commentId: string) => {
        if (!editCommentText.trim() || editCommentText.length > 300) return;
        const updated = comments.map(c =>
            c.commentId === commentId ? { ...c, text: editCommentText.trim() } : c
        );
        saveComments(updated);
        setEditingCommentId(null);
        setEditCommentText("");
    };

    if (reportTarget) {
        return (
            <div className="modal-overlay" onClick={() => setReportTarget(null)} style={{ zIndex: 10000 }}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                    <h2 style={{ margin: '0 0 16px 0' }}>Report {reportTarget.type}</h2>
                    <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
                        Reporting: <strong>{reportTarget.name}</strong>
                    </p>
                    <textarea
                        value={reportReason}
                        onChange={e => setReportReason(e.target.value)}
                        placeholder="Please explain why you are reporting this..."
                        style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '16px', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setReportTarget(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSubmitReport} disabled={!reportReason.trim()} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc2626', color: 'white', cursor: reportReason.trim() ? 'pointer' : 'not-allowed', opacity: reportReason.trim() ? 1 : 0.5 }}>Submit Report</button>
                    </div>
                </div>
            </div>
        );
    }

    if (isCookingMode) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#111827', color: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151' }}>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>{recipe.title}</h2>
                    <button onClick={() => setIsCookingMode(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Exit Cooking Mode
                    </button>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px', textAlign: 'center', overflowY: 'auto' }}>
                    <div style={{ fontSize: '20px', color: '#9ca3af', marginBottom: '24px' }}>
                        Step {currentStep + 1} of {stepsArray.length}
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', maxWidth: '800px', lineHeight: 1.4, transition: 'all 0.3s ease' }}>
                        {stepsArray[currentStep]}
                    </div>
                </div>
                <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', gap: '24px', borderTop: '1px solid #374151' }}>
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        style={{ padding: '16px 32px', fontSize: '20px', borderRadius: '12px', border: 'none', background: currentStep === 0 ? '#374151' : '#3b82f6', color: currentStep === 0 ? '#9ca3af' : 'white', cursor: currentStep === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        Previous Step
                    </button>
                    <button
                        onClick={() => setCurrentStep(prev => Math.min(stepsArray.length - 1, prev + 1))}
                        disabled={currentStep === stepsArray.length - 1}
                        style={{ padding: '16px 32px', fontSize: '20px', borderRadius: '12px', border: 'none', background: currentStep === stepsArray.length - 1 ? '#374151' : '#10b981', color: currentStep === stepsArray.length - 1 ? '#9ca3af' : 'white', cursor: currentStep === stepsArray.length - 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Next Step
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{ float: 'right', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                    ×
                </button>

                <div style={{
                    height: '200px',
                    background: (recipe.image.startsWith('http') || recipe.image.startsWith('data:')) ? `url(${recipe.image})` : recipe.image,
                    backgroundSize: (recipe.image.startsWith('http') || recipe.image.startsWith('data:')) ? 'cover' : undefined,
                    backgroundPosition: 'center',
                    borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px'
                }}>
                    {(!recipe.image.startsWith('http') && !recipe.image.startsWith('data:')) && '🥘'}
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{recipe.title}</h1>

                <button
                    onClick={() => { setIsCookingMode(true); setCurrentStep(0); }}
                    style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}
                >
                    👨‍🍳 Start Cooking Mode
                </button>
                <div style={{ display: 'flex', gap: '12px', color: '#6b7280', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>By @{recipe.hostName}</span>
                    {currentUser && currentUser.id !== recipe.hostId && (
                        <button onClick={() => setReportTarget({ type: 'user', id: recipe.hostId, name: recipe.hostName })} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Report User</button>
                    )}
                    <span>•</span>
                    <span>⏱️ {recipe.time} min</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⭐ {recipe.rating} ({recipe.reviews})
                    </span>
                    {currentUser && currentUser.id !== recipe.hostId && (
                        <button onClick={() => setReportTarget({ type: 'recipe', id: recipe.id, name: recipe.title })} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', marginLeft: 'auto' }}>🚩 Report Recipe</button>
                    )}
                </div>

                {viewMode === 'user' && (
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => toggleLike(recipe.id)}
                            className="post-btn"
                            style={{ background: isLiked ? '#ef4444' : '#f3f4f6', color: isLiked ? 'white' : '#374151', flex: 1, justifyContent: 'center' }}
                        >
                            {isLiked ? '❤️ Liked' : '🤍 Like'}
                        </button>
                        <button
                            onClick={() => toggleWatchLater(recipe.id)}
                            className="post-btn"
                            style={{ background: isWatchLater ? '#3b82f6' : '#f3f4f6', color: isWatchLater ? 'white' : '#374151', flex: 1, justifyContent: 'center' }}
                        >
                            {isWatchLater ? '✅ Saved' : '🔖 Watch Later'}
                        </button>
                    </div>
                )}

                {viewMode === 'user' && !isFeatureDisabled('ratings') && (
                    <section style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Rate this recipe</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => rateRecipe(recipe.id, star)}
                                    style={{
                                        fontSize: '24px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        opacity: star <= userRating ? 1 : 0.3,
                                        transform: star <= userRating ? 'scale(1.2)' : 'scale(1)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {star <= userRating ? '⭐' : '☆'}
                                </button>
                            ))}
                            {userRating > 0 && (
                                <span style={{ marginLeft: '12px', color: '#6b7280', alignSelf: 'center' }}>
                                    {userRating}/5
                                </span>
                            )}
                        </div>
                    </section>
                )}

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Description</h3>
                    <p style={{ color: '#4b5563', lineHeight: 1.6 }}>{recipe.info}</p>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Ingredients</h3>
                    <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#4b5563', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                        {recipe.ingredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                        ))}
                    </ul>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Process</h3>
                    <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {recipe.process}
                    </div>
                </section>

                <section>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#b45309' }}>💡 Important Tips</h3>
                    <p style={{ fontStyle: 'italic', color: '#4b5563', background: '#fffbeb', padding: '12px', borderRadius: '8px' }}>
                        {recipe.tips}
                    </p>
                </section>

                <section style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Discussion</h3>

                    {currentUser && viewMode === 'user' && !isFeatureDisabled('comments') && (
                        <div style={{ marginBottom: '24px' }}>
                            <textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                maxLength={300}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical', minHeight: '80px', marginBottom: '8px', boxSizing: 'border-box' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>{newComment.length}/300</span>
                                <button
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                    style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: newComment.trim() ? 'pointer' : 'not-allowed', opacity: newComment.trim() ? 1 : 0.5 }}
                                >
                                    Post Comment
                                </button>
                            </div>
                        </div>
                    )}
                    {isFeatureDisabled('comments') && (
                        <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
                            💬 Comments are temporarily disabled during maintenance.
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {comments.sort((a, b) => a.createdAt - b.createdAt).map(comment => (
                            <div key={comment.commentId} style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div>
                                        <span style={{ fontWeight: 'bold', marginRight: '8px', color: 'black' }}>@{comment.username}</span>
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    {(currentUser?.id === comment.userId || currentUser?.role === 'admin') && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {currentUser?.id === comment.userId && (
                                                <button onClick={() => { setEditingCommentId(comment.commentId); setEditCommentText(comment.text); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px' }}>Edit</button>
                                            )}
                                            <button onClick={() => handleDeleteComment(comment.commentId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>Delete</button>
                                        </div>
                                    )}
                                    {currentUser && currentUser.id !== comment.userId && (
                                        <button onClick={() => setReportTarget({ type: 'comment', id: comment.commentId, name: comment.text.substring(0, 20) })} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>🚩 Report</button>
                                    )}
                                </div>

                                {editingCommentId === comment.commentId ? (
                                    <div style={{ marginTop: '8px' }}>
                                        <textarea value={editCommentText} onChange={e => setEditCommentText(e.target.value)} maxLength={300} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '8px', boxSizing: 'border-box' }} />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEditComment(comment.commentId)} style={{ padding: '4px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                                            <button onClick={() => setEditingCommentId(null)} style={{ padding: '4px 12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ margin: '0 0 12px 0', color: '#374151' }}>{comment.text}</p>
                                )}

                                <div>
                                    <button onClick={() => setReplyingTo(replyingTo === comment.commentId ? null : comment.commentId)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', padding: 0 }}>
                                        💬 Reply
                                    </button>
                                </div>

                                {replyingTo === comment.commentId && currentUser && viewMode === 'user' && !isFeatureDisabled('comments') && (
                                    <div style={{ marginTop: '12px', paddingLeft: '16px', borderLeft: '2px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                placeholder="Write a reply..."
                                                maxLength={300}
                                                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                            />
                                            <button onClick={() => handleAddReply(comment.commentId)} disabled={!replyText.trim()} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: replyText.trim() ? 'pointer' : 'not-allowed', opacity: replyText.trim() ? 1 : 0.5 }}>
                                                Reply
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {comment.replies.length > 0 && (
                                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '16px', borderLeft: '2px solid #e5e7eb' }}>
                                        {comment.replies.map(reply => (
                                            <div key={reply.replyId}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', marginRight: '8px', fontSize: '14px', color: 'black' }}>@{reply.username}</span>
                                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                            {new Date(reply.createdAt).toLocaleDateString()} {new Date(reply.createdAt).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>{reply.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
